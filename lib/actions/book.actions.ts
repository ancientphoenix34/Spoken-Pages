'use server'

import mongoose from "mongoose";
import { CreateBook, TextSegment } from "@/components/types";
import { connectToDatabase } from "@/database/mongoose";
import { escapeRegex, generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";
import { revalidatePath } from "next/cache";


export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);

        const existingBook = await Book.findOne({ slug }).lean();

        if (existingBook) {
            return {
                exists: true,
                book: serializeData(existingBook)
            }
        }
        return {
            exists: false,
        }
    } catch (e) {
        console.error("Erroe checking book exists", e);
        return {
            exists: false,
            error: e
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({ slug }).lean();

        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            }
        }

        // Check subscription limits
        const book = await Book.create({ ...data, slug, totalSegments: 0 })
        
        revalidatePath('/');
        
        return {
            success: true,
            data: serializeData(book),
            alreadyExists: false,
        }

    } catch (e) {
        console.error("Error creating a book", e);
        return {
            success: false,
            error: e,
        }
    }
}

export const saveBookSegemnts = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();

        console.log("Saving book segemnts...");

        const segemntsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }))

        await BookSegment.insertMany(segemntsToInsert);

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

        console.log("Book segments saved successfully");

        return {
            success: true,
            data: { segementsCreated: segments.length }
        }
    } catch (e) {
        console.error("error saving book segments", e);

        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete({ bookId });
        console.log("Deleted book segements and book due to failure to save segments");
        return {
            success: false,
            error: e
        }
    }
}

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findOne({ slug }).lean();

        if (!book) {
            return {
                success: false,
            }
        }

        return {
            success: true,
            data: serializeData(book)
        }
    } catch (e) {
        console.error('Error fetching book by slug', e);
        return {
            success: false,
            error: e
        }
    }
}

export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // Try MongoDB text search first (requires text index)
        let segments: Record<string, unknown>[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // Text index may not exist — fall through to regex fallback
            segments = [];
        }

        // Fallback: regex search matching ANY keyword
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const pattern = keywords.map(escapeRegex).join('|');

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`Search complete. Found ${segments.length} results`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('Error searching segments:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};

export const getAllBooks = async () => {
    try {
        await connectToDatabase();

        const books = await Book.find().sort({ createdAt: -1 }).lean();

        return {
            success: true,
            data: serializeData(books)
        }
    } catch (e) {
        console.error('Error connecting to database', e);
        return {
            success: false,
            error: e
        }
    }
}