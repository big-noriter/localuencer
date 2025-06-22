import ProductCard from "@/components/mina/product-card"
import { mockProducts } from "@/lib/data"
import { ShoppingCart } from "lucide-react"

export default function ShopPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold">미나's 샵</h1>
      </div>
      <p className="text-lg text-muted-foreground">미나가 직접 사용해보고 추천하는 아이템들을 만나보세요!</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
