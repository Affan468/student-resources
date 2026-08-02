import { useEffect } from 'react';

export function useSEO({ title, description }) {
  useEffect(() => {
    const baseTitle = 'COMSATS University Study Resource Hub (CE • EE • EEE)';
    const newTitle = title ? `${title} | COMSATS Hub` : baseTitle;
    document.title = newTitle;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }, [title, description]);
}

export default useSEO;
