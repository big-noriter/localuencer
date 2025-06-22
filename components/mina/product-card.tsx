import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Product } from "@/lib/data"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-square bg-muted rounded-t-md overflow-hidden">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <CardTitle className="text-md mb-1 line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{product.description}</CardDescription>
        <p className="text-lg font-semibold mt-2">{product.price}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full bg-card text-card-foreground" asChild>
          {/* In a real app, this would link to /shop/[id] or add to cart */}
          <Link href="/shop">
            <ShoppingCart className="mr-2 h-4 w-4" />
            상세 보기
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
