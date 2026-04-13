import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxEKB0T1qAYOoGFBomof5i16G1BBEvpQ6Y6rFEBz-akKhHVyvR_MUMXmCkx33kub8BAcw/exec";
   

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "";

    if (!["members", "schedules", "memos"].includes(action)) {
      return NextResponse.json({
        success: false,
        message: "잘못된 요청입니다.",
      });
    }

    const url = `${SCRIPT_URL}?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "서버 요청 중 오류가 발생했습니다.",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body.action || "").trim();

    if (!["saveSchedule", "deleteSchedule", "saveMemo"].includes(action)) {
      return NextResponse.json({
        success: false,
        message: "잘못된 요청입니다.",
      });
    }

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "서버 요청 중 오류가 발생했습니다.",
    });
  }
}
