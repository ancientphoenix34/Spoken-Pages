'use server'

import { CreateBook, TextSegment } from "@/components/types";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";

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