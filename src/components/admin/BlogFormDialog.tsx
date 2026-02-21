import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SingleImageUpload } from "./SingleImageUpload";
import { RichTextEditor } from "./RichTextEditor";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  main_image: z.string().optional(),
  author_name: z.string().optional(),
  is_published: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  main_image: string | null;
  author_name: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title?: string | null;
  meta_description?: string | null;
}

interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isLoading: boolean;
}

export function BlogFormDialog({
  open,
  onOpenChange,
  blog,
  onSubmit,
  isLoading,
}: BlogFormDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>("");

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      main_image: "",
      author_name: "Admin",
      is_published: false,
      meta_title: "",
      meta_description: "",
    },
  });

  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || "",
        content: blog.content,
        main_image: blog.main_image || "",
        author_name: blog.author_name || "Admin",
        is_published: blog.is_published || false,
        meta_title: blog.meta_title || "",
        meta_description: blog.meta_description || "",
      });
      setImageUrl(blog.main_image || "");
    } else {
      form.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        main_image: "",
        author_name: "Admin",
        is_published: false,
        meta_title: "",
        meta_description: "",
      });
      setImageUrl("");
    }
  }, [blog, form]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!blog) {
      form.setValue("slug", generateSlug(title));
    }
  };

  const handleSubmit = async (data: BlogFormData) => {
    await onSubmit({ ...data, main_image: imageUrl });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blog ? "Edit Blog Post" : "Add New Blog Post"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={handleTitleChange}
                      placeholder="Enter blog title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="blog-post-slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of the blog post"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Content</FormLabel>
              <Controller
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Full blog content..."
                    />
                    {fieldState.error && (
                      <p className="text-sm font-medium text-destructive mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </FormItem>

            <div>
              <FormLabel>Main Image</FormLabel>
              <SingleImageUpload
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>

            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Author name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel className="mb-0">Published</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* SEO Section */}
            <div className="border rounded-md p-4 space-y-4">
              <p className="text-sm font-semibold text-foreground">SEO</p>

              <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SEO page title (defaults to post title)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="SEO description (150–160 characters recommended)"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : blog ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
