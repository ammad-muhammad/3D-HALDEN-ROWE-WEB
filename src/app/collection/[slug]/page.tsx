import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products, getProduct } from '@/data/products';
import ProductDetail from '@/components/products/ProductDetail';

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    return { title: 'Product Not Found | Halden & Rowe' };
  }
  return {
    title: `${product.name} | Halden & Rowe`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  // 3 other products, prioritizing same category first
  const sameCategory = products.filter(
    (p) => p.slug !== product.slug && p.category === product.category
  );
  const otherCategory = products.filter(
    (p) => p.slug !== product.slug && p.category !== product.category
  );
  const related = [...sameCategory, ...otherCategory].slice(0, 3);

  return <ProductDetail product={product} related={related} />;
}
