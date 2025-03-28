export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "food" | "drink";
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Buñuelo",
    description:
      "Traditional Colombian buñuelo made with cheese dough, perfectly fried to golden perfection. Crispy outside, soft inside.",
    price: 2.99,
    image:
      "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80",
    category: "food",
  },
  {
    id: "2",
    name: "Hot Tinto Coffee",
    description:
      "Colombian black coffee brewed to perfection. Rich, aromatic, and full-bodied.",
    price: 1.99,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
    category: "drink",
  },
  {
    id: "3",
    name: "Cheese Pandebono",
    description:
      "Traditional Colombian cheese bread made with cornmeal and cassava starch. Soft and cheesy.",
    price: 2.49,
    image:
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80",
    category: "food",
  },
  {
    id: "4",
    name: "Chocolate Caliente",
    description:
      "Traditional Colombian hot chocolate made with rich cocoa and a hint of cinnamon.",
    price: 2.99,
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    category: "drink",
  },
  {
    id: "5",
    name: "Almojábana",
    description:
      "Colombian cheese bread made with cuajada cheese and corn flour. Light and fluffy.",
    price: 2.49,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    category: "food",
  },
  {
    id: "6",
    name: "Pan de Bono Combo",
    description:
      "Fresh pandebono served with your choice of hot tinto or chocolate caliente.",
    price: 4.99,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    category: "food",
  },
];
