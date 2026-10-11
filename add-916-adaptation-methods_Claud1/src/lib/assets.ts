// Тестовые изображения для библиотеки шаблонов (To_169-подобный тестовый набор).
// Используются как data-sb-media источники — подстановка новых изображений
// не нарушает работу методов, т.к. они оперируют слотами, а не конкретным файлом.

export const IMG = {
  architecture1:
    "https://images.pexels.com/photos/9473066/pexels-photo-9473066.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  architecture2:
    "https://images.pexels.com/photos/28506788/pexels-photo-28506788.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  architecture3:
    "https://images.pexels.com/photos/35251110/pexels-photo-35251110.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1100",
  portrait1:
    "https://images.pexels.com/photos/19222076/pexels-photo-19222076.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1100",
  portrait2:
    "https://images.pexels.com/photos/33852945/pexels-photo-33852945.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1100",
  portrait3:
    "https://images.pexels.com/photos/33714925/pexels-photo-33714925.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1100",
  city1:
    "https://images.pexels.com/photos/28993172/pexels-photo-28993172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  city2:
    "https://images.pexels.com/photos/30776676/pexels-photo-30776676.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  city3:
    "https://images.pexels.com/photos/15939068/pexels-photo-15939068.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  product1:
    "https://images.pexels.com/photos/33713064/pexels-photo-33713064.png?auto=compress&cs=tinysrgb&h=900&w=900",
  product2:
    "https://images.pexels.com/photos/33713063/pexels-photo-33713063.png?auto=compress&cs=tinysrgb&h=900&w=900",
  product3:
    "https://images.pexels.com/photos/17650220/pexels-photo-17650220.jpeg?auto=compress&cs=tinysrgb&h=900&w=900",
};

export function mediaTag(opts: {
  src: string;
  alt: string;
  aspect: string; // "16/9"
  extraStyle?: string;
  dataAttrs: string; // уже готовая строка data-sb-media data-slot=... и т.д.
}): string {
  const { src, aspect, extraStyle = "", dataAttrs } = opts;
  return `<div ${dataAttrs} data-kind="image" role="img" aria-label="${opts.alt}" style="aspect-ratio:${aspect}; background:#e7e5e0 url('${src}') center/cover no-repeat; ${extraStyle}"></div>`;
}
