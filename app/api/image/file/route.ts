import { NextResponse } from "next/server";
import { getImageFile } from "@/lib/store";

export const runtime = "nodejs";

// 今週のメニュー画像の本体を配信する（誰でも閲覧可）
export async function GET() {
  const file = await getImageFile();
  if (!file) {
    return NextResponse.json({ message: "画像が登録されていません。" }, { status: 404 });
  }
  return new NextResponse(file.buffer, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=300",
    },
  });
}
