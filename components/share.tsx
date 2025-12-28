// Mark this component as a client component
'use client';

import React from 'react';
import { Twitter, Facebook, Linkedin, Smartphone } from 'lucide-react';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  customMessage?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, description, imageUrl, customMessage }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : url || '';

  const encodedUrl = encodeURIComponent(currentUrl || url || '');
  const encodedTitle = encodeURIComponent(title || '');
  const encodedCustomMessage = encodeURIComponent(customMessage || '');
  const encodedDescription = encodeURIComponent(description || '');
  const encodedImage = encodeURIComponent(imageUrl || '');
  const twitterText = encodedCustomMessage ? `${encodedCustomMessage}%20${encodedTitle}` : encodedTitle;
  const twitter = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${twitterText}${encodedImage ? `&image=${encodedImage}` : ''}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const whatsappText = encodedCustomMessage ? `${encodedCustomMessage}%20${encodedUrl}` : `${encodedTitle}%20${encodedUrl}`;
  const whatsapp = `https://api.whatsapp.com/send?text=${whatsappText}${encodedImage ? `%20${encodedImage}` : ''}`;

  const open = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-3 mt-8">
      <button
        aria-label="Share on Twitter"
        onClick={() => open(twitter)}
        className="p-2 rounded-md hover:bg-muted/40"
      >
        <Twitter />
      </button>

      <button
        aria-label="Share on Facebook"
        onClick={() => open(facebook)}
        className="p-2 rounded-md hover:bg-muted/40"
      >
        <Facebook />
      </button>

      <button
        aria-label="Share on LinkedIn"
        onClick={() => open(linkedin)}
        className="p-2 rounded-md hover:bg-muted/40"
      >
        <Linkedin />
      </button>

      <button
        aria-label="Share via WhatsApp"
        onClick={() => open(whatsapp)}
        className="p-2 rounded-md hover:bg-muted/40"
      >
        <Smartphone />
      </button>
    </div>
  );
};

export default ShareButtons;
