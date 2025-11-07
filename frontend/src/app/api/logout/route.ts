import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookies = request.headers.get("cookie") || "";

    // Call Django logout endpoint
    const res = await fetch("http://localhost:8000/auth/logout/", {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookies,
      },
    });

    if (res.ok) {
      return NextResponse.json({ status: "success" });
    } else {
      return NextResponse.json(
        { status: "error", detail: "Failed to logout from server" },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { status: "error", detail: "Failed to logout" },
      { status: 500 }
    );
  }
}

