import { NextRequest, NextResponse } from "next/server";
import { getImageInfo, saveImageFile } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// メタ情報（更新日時）のみ返す。画像本体は /api/image/file で配信する
export async function GET() {
  const info = await getImageInfo();
  return NextResponse.json({ image: info });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "画像ファイルを選択してください。" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ message: "対応していない画像形式です（JPEG / PNG / WebP）。" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ message: "画像サイズが大きすぎます（8MBまで）。" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const info = await saveImageFile(bytes, ext);
  return NextResponse.json({ image: info });
}
