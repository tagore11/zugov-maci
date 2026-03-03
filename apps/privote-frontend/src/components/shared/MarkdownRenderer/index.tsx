import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        a: ({ node, ...props }) => <a target='_blank' rel='noopener noreferrer' {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
