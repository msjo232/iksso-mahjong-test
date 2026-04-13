import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxEKB0T1qAYOoGFBomof5i16G1BBEvpQ6Y6rFEBz-akKhHVyvR_MUMXmCkx33kub8BAcw/exec";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (!action) {
      return NextResponse.json({
        success: false,
        message: "action이 필요합니다.",
      });
    }

    const targetUrl = `${SCRIPT_URL}?${searchParams.toString()}`;

    const res = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error ? error.message : "GET 요청 처리 중 오류 발생",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action;

    const allowedActions = [
      "saveSchedule",
      "deleteSchedule",
      "saveMemo",
      "deleteMemo",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json({
        success: false,
        message: "잘못된 요청입니다.",
      });
    }

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error ? error.message : "POST 요청 처리 중 오류 발생",
    });
  }
}
