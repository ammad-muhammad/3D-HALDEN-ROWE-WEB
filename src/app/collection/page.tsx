import { Metadata } from 'next';
import { products } from '@/data/products';
import CollectionClient from './CollectionClient';

export const metadata: Metadata = {
  title: 'Collection | Halden & Rowe',
  description: 'Explore our full bespoke collection of hand-crafted suits, two-pieces, three-pieces, and dinner wear.',
};

export default function CollectionPage() {
  return <CollectionClient products={products} />;
}
