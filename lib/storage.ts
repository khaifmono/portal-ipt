import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

export async function saveFile(relativePath: string, data: Buffer | Blob): Promise<string> {
  const fullPath = path.join(UPLOAD_DIR, relativePath)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  const buffer = data instanceof Blob ? Buffer.from(await data.arrayBuffer()) : data
  await fs.writeFile(fullPath, buffer)
  return relativePath
}

export async function getFile(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(UPLOAD_DIR, relativePath)
  return fs.readFile(fullPath)
}
