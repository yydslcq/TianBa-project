import { useEffect, useRef, useState } from 'react';

export default function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`${className} reveal ${visible ? 'is-visible' : ''}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
