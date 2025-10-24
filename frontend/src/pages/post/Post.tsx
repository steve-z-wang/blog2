import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Post } from "../types";
import ReactMarkdown from "react-markdown";
import CommentSection from "./CommentSection";
import { Section, Page, PageTitle } from "../../components";
import NotFound from "../NotFound";
import { api } from "../../api/client";
import { renderPostDetails } from "../../utils/renderPostDetails";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const fetchedPost = await api.posts.getBySlug(id);
        setPost(fetchedPost);
      } catch (err) {
        // If post is not found, render NotFound page
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return null; 
  }

  if (!post) {
    return <NotFound />;
  }

  return (
    <Page>
      <PageTitle>
        {post.title}
        {renderPostDetails(post)}
      </PageTitle>

      {/* Article */}
      <Section className="prose max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </Section>

      {/* Comment */}
      <Section>
        {id && (
          <CommentSection postId={post.id} comments={post.comments ?? []} />
        )}
      </Section>

      {/* Subscribe */}
      <Section className="text-center">
        <p>
          Like this post?{" "}
          <Link to="/subscribe" className="font-medium underline">
            Subscribe for more
          </Link>
          .
        </p>
      </Section>

      {/* Back to Home */}
      <Section className="text-center">
        <Link to="/" className="text-muted font-medium">
          Back to Home
        </Link>
      </Section>
    </Page>
  );
}
