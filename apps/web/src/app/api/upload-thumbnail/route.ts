import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@marketingclickcannabis/auth";
import { env } from "@marketingclickcannabis/env/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isR2Configured = Boolean(
    env.CLOUDFLARE_ACCOUNT_ID &&
    env.CLOUDFLARE_R2_BUCKET &&
    env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  );

  if (!isR2Configured) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: `Only image files are allowed. Received: ${file.type || "empty"}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 5MB limit" },
      { status: 400 }
    );
  }

  const extMap: Record<string, string> = { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" };
  const ext = extMap[file.type] ?? "png";
  const key = `thumbnails/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl = env.CLOUDFLARE_R2_PUBLIC_URL
      ? `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
      : `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.CLOUDFLARE_R2_BUCKET}/${key}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("R2 thumbnail upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
