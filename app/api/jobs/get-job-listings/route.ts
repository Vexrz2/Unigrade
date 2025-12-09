import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const { queryParams } = await request.json();
        const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
            headers: {
                'X-Rapidapi-Key': process.env.RAPIDAPI_KEY,
            },
            params: queryParams,
        });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch job listings';
        return NextResponse.json({ message }, { status: 400 });
    }
}
