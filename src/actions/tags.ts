"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tagSchema, TagData } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createTag(data: TagData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = tagSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    await db.tag.create({
      data: {
        ...validatedFields.data,
        companyId: session.user.companyId,
      },
    })
    revalidatePath("/tags")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create tag" }
  }
}

export async function updateTag(id: string, data: TagData) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  const validatedFields = tagSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  try {
    // Verify ownership
    const tag = await db.tag.findUnique({
      where: { id, companyId: session.user.companyId },
    })

    if (!tag) {
      return { error: "Tag not found" }
    }

    await db.tag.update({
      where: { id },
      data: validatedFields.data,
    })
    revalidatePath("/tags")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update tag" }
  }
}

export async function deleteTag(id: string) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return { error: "Unauthorized" }
  }

  try {
    // Verify ownership
    const tag = await db.tag.findUnique({
      where: { id, companyId: session.user.companyId },
    })

    if (!tag) {
      return { error: "Tag not found" }
    }

    await db.tag.delete({
      where: { id },
    })
    revalidatePath("/tags")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete tag" }
  }
}
