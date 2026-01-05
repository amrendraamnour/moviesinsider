import Link from "next/link";

import { Post } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";

import {
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
  getCategoryBySlug,
} from "@/lib/wordpress";

export async function PostCard({
  post,
  selectedCategorySlug,
}: {
  post: Post;
  selectedCategorySlug?: string;
}) {
  let media = null;
  let author = null;
  try {
    media = post.featured_media
      ? await getFeaturedMediaById(post.featured_media)
      : null;
  } catch (e) {
    console.warn("Failed to fetch featured media:", e);
    media = null;
  }

  try {
    author = post.author ? await getAuthorById(post.author) : null;
  } catch (e) {
    console.warn("Failed to fetch author:", e);
    author = null;
  }
  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  let category = null;
  try {
    // If a category slug is provided by the parent (e.g. when listing by
    // category), prefer that category when the post belongs to it. This
    // prevents showing an unrelated first category (e.g. "Bollywood") when
    // filtering by another category (e.g. "Sports").
    if (selectedCategorySlug) {
      try {
        const catObj = await getCategoryBySlug(selectedCategorySlug);
        if (catObj && post.categories?.includes(catObj.id)) {
          category = catObj;
        }
      } catch (e) {
        // ignore and fallback to first category
      }
    }

    if (!category) {
      category = post.categories?.[0]
        ? await getCategoryById(post.categories[0])
        : null;
    }
  } catch (e) {
    console.warn("Failed to fetch category:", e);
    category = null;
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "border p-4 bg-accent/30 rounded-lg group flex justify-between flex-col not-prose gap-8",
        "hover:bg-accent/75 transition-all"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="h-48 w-full overflow-hidden relative rounded-md border flex items-center justify-center bg-muted">
          {media?.source_url ? (
            <img
              className="h-full w-full object-cover"
              src={media.source_url}
              alt={post.title?.rendered || "Post thumbnail"}
              width={400}
              height={200}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              No image available
            </div>
          )}
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: post.title?.rendered || "Untitled Post",
          }}
          className="text-xl text-primary font-medium group-hover:underline decoration-muted-foreground underline-offset-4 decoration-dotted transition-all"
        ></div>
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{
            __html: post.excerpt?.rendered
              ? post.excerpt.rendered.split(" ").slice(0, 12).join(" ").trim() +
                "..."
              : "No excerpt available",
          }}
        ></div>
      </div>

      <div className="flex flex-col gap-4">
        <hr />
        <div className="flex justify-between items-center text-xs">
          <p>{category?.name || "Uncategorized"}</p>
          <p>{date}</p>
        </div>
      </div>
    </Link>
  );
}
