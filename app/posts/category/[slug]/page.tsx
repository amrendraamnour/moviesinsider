import {
  getPostsByCategoryPaginated,
  getAllAuthors,
  getAllTags,
  getAllCategories,
  searchAuthors,
  searchTags,
  searchCategories,
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

export const dynamic = "auto";
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  return {
    title: `Posts in ${slug}`,
    description: `Posts in category ${slug}`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; search?: string };
}) {
  const { slug } = params;
  const { page: pageParam, search } = searchParams || {};

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const postsPerPage = 9;

  const [authors, tags, categories] = await Promise.all([
    search ? searchAuthors(search) : getAllAuthors(),
    search ? searchTags(search) : getAllTags(),
    search ? searchCategories(search) : getAllCategories(),
  ]);

  const category = await getCategoryBySlug(slug);
  const categoryId = category?.id;

  const postsResponse = await getPostsByCategoryPaginated(
    Number(categoryId || 0),
    page,
    postsPerPage
  );

  const { data: posts, headers } = postsResponse;
  const { total, totalPages } = headers;

  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (search) params.set("search", search);
    return `/posts/category/${slug}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <Prose>
            <h2>Posts in {category?.name || slug}</h2>
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
              selectedAuthor={undefined}
              selectedTag={undefined}
              selectedCategory={slug}
            />
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
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
                      <PaginationPrevious href={createPaginationUrl(page - 1)} />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - page) <= 1
                      );
                    })
                    .map((pageNum, index, array) => {
                      const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && <span className="px-2">...</span>}
                          <PaginationItem>
                            <PaginationLink href={createPaginationUrl(pageNum)} isActive={pageNum === page}>
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
