import { NextRequest, NextResponse } from 'next/server';

const API_URL = "https://script.google.com/macros/s/AKfycbyeZXXCckoEbDLst02Atezw4yxgkLHQpCi_AKODk7WIHgM19QSTu7mUg5gK_Hw2MUZKYQ/exec";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();

  try {
    const res = await fetch(`${API_URL}?${query}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'API 연결 실패',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'API 연결 실패',
    });
  }
}
