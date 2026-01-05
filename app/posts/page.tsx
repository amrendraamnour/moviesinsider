import {
  getPostsPaginated,
  getAllAuthors,
  getAllTags,
  getAllCategories,
  searchAuthors,
  searchTags,
  searchCategories,
  getTagBySlug,
  getCategoryBySlug,
} from "@/lib/wordpress";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Section, Container, Prose } from "@/components/craft";
import { PostCard } from "@/components/posts/post-card";
import { FilterPosts } from "@/components/posts/filter";
import { SearchInput } from "@/components/posts/search-input";

import type { Metadata } from "next";
import BackButton from "@/components/back";

export const metadata: Metadata = {
  title: "Blog Posts",
  description: "Browse all our blog posts",
};

export const dynamic = "auto";
export const revalidate = 60;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    author?: string;
    tag?: string;
    category?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const { author, tag, category, page: pageParam, search } = params;

  // Handle pagination
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const postsPerPage = 9;

  // Fetch authors, tags and categories first (used for UI and to resolve slugs)
  const [authors, tags, categories] = await Promise.all([
    search ? searchAuthors(search) : getAllAuthors(),
    search ? searchTags(search) : getAllTags(),
    search ? searchCategories(search) : getAllCategories(),
  ]);

  // If `tag` is a slug (non-numeric), resolve it to an ID for the API
  let tagForApi: string | undefined = tag;
  if (tag && isNaN(Number(tag))) {
    const found = tags.find((t: any) => t.slug === tag);
    if (found) {
      tagForApi = String(found.id);
    } else {
      const tagObj = await getTagBySlug(tag);
      tagForApi = tagObj ? String(tagObj.id) : undefined;
    }
  }

  // If `category` is a slug (non-numeric), resolve it to an ID for the API
  let categoryForApi: string | undefined = category;
  if (category && isNaN(Number(category))) {
    const foundCat = categories.find((c: any) => c.slug === category);
    if (foundCat) {
      categoryForApi = String(foundCat.id);
    } else {
      const categoryObj = await getCategoryBySlug(category);
      categoryForApi = categoryObj ? String(categoryObj.id) : undefined;
    }
  }

  // Fetch posts (now that we have resolved any tag/category slug to an ID)
  const postsResponse = await getPostsPaginated(page, postsPerPage, {
    author,
    tag: tagForApi,
    category: categoryForApi,
    search,
  });

  const { data: posts, headers } = postsResponse;
  const { total, totalPages } = headers;

  // Create pagination URL helper
  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (category) params.set("category", category);
    if (author) params.set("author", author);
    if (tag) params.set("tag", tag);
    if (search) params.set("search", search);
    return `/posts${params.toString() ? `?${params.toString()}` : ""}`;
  };

  // Ensure the filter UI shows the slug value if the incoming `tag` was an ID
  const selectedTagForUI =
    tag && /^\d+$/.test(tag)
      ? // find the slug for the numeric id
        (tags.find((t: any) => t.id === Number(tag)) || {}).slug || tag
      : tag;

  const selectedCategoryForUI =
    category && /^\d+$/.test(category)
      ? (categories.find((c: any) => c.id === Number(category)) || {}).slug ||
        category
      : category;

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <Prose>
            <h2>All Posts</h2>
            <p className="text-muted-foreground">
              {total} {total === 1 ? "post" : "posts"} found
              {search && " matching your search"}
            </p>
          </Prose>

          <div className="space-y-4">
            <SearchInput defaultValue={search} />

            <FilterPosts
              authors={authors}
              tags={tags}
              categories={categories}
              selectedAuthor={author}
              selectedTag={selectedTagForUI}
              selectedCategory={selectedCategoryForUI}
            />
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  selectedCategorySlug={selectedCategoryForUI}
                />
              ))}
            </div>
          ) : (
            <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
              <p>No posts found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center py-8">
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={createPaginationUrl(page - 1)}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      // Show current page, first page, last page, and 2 pages around current
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - page) <= 1
                      );
                    })
                    .map((pageNum, index, array) => {
                      const showEllipsis =
                        index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && <span className="px-2">...</span>}
                          <PaginationItem>
                            <PaginationLink
                              href={createPaginationUrl(pageNum)}
                              isActive={pageNum === page}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      );
                    })}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext href={createPaginationUrl(page + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
        <BackButton />
      </Container>
    </Section>
  );
}
