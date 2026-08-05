import { NextRequest, NextResponse } from "next/server";
import { getImageInfo, saveImageFile } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * 画像はBase64に変換してデータベースへ保存する。
 * Base64にすると容量が約1.37倍に増え、保存先(Upstash Redis)の
 * 1リクエスト上限にかかりやすいため、上限は控えめに設定している。
 * 管理画面側でアップロード前に自動縮小しているので、通常この上限には達しない。
 */
const MAX_IMAGE_BYTES = 1_200_000; // 約1.2MB

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
    return NextResponse.json(
      { message: "対応していない画像形式です。JPG・PNG・WebP のいずれかを選んでください。" },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { message: "画像の容量が大きすぎます。もう少し小さい画像を選んでください。" },
      { status: 400 }
    );
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const info = await saveImageFile(bytes, ext);
    return NextResponse.json({ image: info });
  } catch {
    return NextResponse.json(
      { message: "画像の保存に失敗しました。通信環境を確認してもう一度お試しください。" },
      { status: 500 }
    );
  }
}
