/* Сгенерировано tools/build-adaptation-manifest.js — не редактировать вручную. */
window.PMS_ADAPTATION_MANIFEST = {
  "path": "adaptation-modules",
  "exists": true,
  "libraries": [
    {
      "rel": "_shared/css-groups.js"
    },
    {
      "rel": "_shared/lab/adapter.js"
    },
    {
      "rel": "_shared/lab/claud1.js"
    },
    {
      "rel": "_shared/lab/gemini.js"
    },
    {
      "rel": "_shared/lab/grok.js"
    },
    {
      "rel": "_shared/lab/iface-v3011.js"
    }
  ],
  "modules": [
    {
      "folder": "claud1-balanced",
      "rel": "claud1-balanced/module.js",
      "descriptor": {
        "id": "claud1-balanced",
        "name": "Сбалансированная композиция · Claude 1",
        "version": "1.0.0",
        "description": "Высота блока пропорциональна его «весу», остаток — в рассчитанные равные интервалы. [Claude 1]",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 101,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "claud1-editorial",
      "rel": "claud1-editorial/module.js",
      "descriptor": {
        "id": "claud1-editorial",
        "name": "Вертикальная редакционная композиция · Claude 1",
        "version": "1.0.0",
        "description": "Flex-grow растягивает группы на всю высоту 1600px вместо скопления наверху. [Claude 1]",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 102,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "claud1-typographic",
      "rel": "claud1-typographic/module.js",
      "descriptor": {
        "id": "claud1-typographic",
        "name": "Типографическая вертикальная композиция · Claude 1",
        "version": "1.0.0",
        "description": "Заголовок резко увеличен и держит композицию, медиа — маленький акцент в углу. [Claude 1]",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 103,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "compact",
      "rel": "compact/module.js",
      "descriptor": {
        "id": "compact",
        "name": "Адаптивная сетка",
        "version": "1.1.0",
        "description": "Сохраняет исходный порядок DOM и основные CSS grid/flex, уплотняя размеры для кадра 16:9.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "16:9",
          "9:16",
          "1:1",
          "4:3"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 2,
        "engineApi": 1,
        "titleRole": false,
        "markup": [
          ".sv-section",
          "[data-sb-editable]"
        ]
      }
    },
    {
      "folder": "fit",
      "rel": "fit/module.js",
      "descriptor": {
        "id": "fit",
        "name": "Контрольный safe-fit",
        "version": "1.1.0",
        "description": "Контрольный вариант для сравнения: исходная структура сохраняется максимально, переполнение уменьшается с помощью плавного уменьшения размеров.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "16:9",
          "9:16",
          "1:1",
          "4:3"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 4,
        "engineApi": 1,
        "titleRole": false,
        "markup": [
          ".sv-section",
          "[data-sb-editable]"
        ]
      }
    },
    {
      "folder": "gemini-balanced",
      "rel": "gemini-balanced/module.js",
      "descriptor": {
        "id": "gemini-balanced",
        "name": "Сбалансированная композиция · Gemini Cool",
        "version": "1.0.0",
        "description": "Равномерное распределение визуального веса и адаптивные интервалы по золотому сечению.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 104,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "gemini-editorial",
      "rel": "gemini-editorial/module.js",
      "descriptor": {
        "id": "gemini-editorial",
        "name": "Вертикальная редакционная композиция · Gemini Cool",
        "version": "1.0.0",
        "description": "Делит кадр на трёхчастную иерархию: вводка → ядро с медиа → заземлённый футер, без пустоты снизу.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 105,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "gemini-hero-media",
      "rel": "gemini-hero-media/module.js",
      "descriptor": {
        "id": "gemini-hero-media",
        "name": "Композиция с главным медиа · Gemini Cool",
        "version": "1.0.0",
        "description": "Доминирующее медиа вертикального масштаба (4:5 / 1:1) с выверенной типографикой вокруг.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 106,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "gemini-media-grid",
      "rel": "gemini-media-grid/module.js",
      "descriptor": {
        "id": "gemini-media-grid",
        "name": "Вертикальная медиасетка · Gemini Cool",
        "version": "1.0.0",
        "description": "Последовательность крупных кадров и асимметричная вертикальная раскладка для шаблонов с 2+ медиа.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 107,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "gemini-typographic",
      "rel": "gemini-typographic/module.js",
      "descriptor": {
        "id": "gemini-typographic",
        "name": "Типографический вертикальный плакат · Gemini Cool",
        "version": "1.0.0",
        "description": "Монументальная швейцарская типографика, ритмичные манифесты и структурированные списки.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 108,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "grok-balanced",
      "rel": "grok-balanced/module.js",
      "descriptor": {
        "id": "grok-balanced",
        "name": "Сбалансированная · Grok (React)",
        "version": "1.0.0",
        "description": "CSS grid с 1fr-рядом под медиа, низ кадра занят метой; пустота входит в ритм. [Grok React]",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 109,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "grok-editorial",
      "rel": "grok-editorial/module.js",
      "descriptor": {
        "id": "grok-editorial",
        "name": "Вертикальная редакционная · Grok (React)",
        "version": "1.0.0",
        "description": "Роли распределены по высоте 1600px через space-between; мета закреплена внизу. [Grok React]",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 110,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "grok-hero",
      "rel": "grok-hero/module.js",
      "descriptor": {
        "id": "grok-hero",
        "name": "Главное медиа · Grok (React)",
        "version": "1.0.0",
        "description": "Первое медиа занимает основную высоту кадра, текст — обвязка сверху и снизу. [Grok React]",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 111,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "iface-smart",
      "rel": "iface-smart/module.js",
      "descriptor": {
        "id": "iface-smart",
        "name": "Реконструкция по ролям · Базовая лаборатория",
        "version": "1.0.0",
        "description": "Перекомпоновывает заголовки, медиа и метаданные под вертикальный кадр 9:16.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 112,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "iface-split",
      "rel": "iface-split/module.js",
      "descriptor": {
        "id": "iface-split",
        "name": "Редакционный split · Базовая лаборатория",
        "version": "1.0.0",
        "description": "При наличии текста и медиа делает явную двухколоночную композицию.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 113,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "smart",
      "rel": "smart/module.js",
      "descriptor": {
        "id": "smart",
        "name": "Реконструкция по ролям",
        "version": "1.1.0",
        "description": "Меняет групповую раскладку, распознаёт роли title/body/media/meta. Предпочтительный метод для длинных секций.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "16:9",
          "9:16",
          "1:1",
          "4:3"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 1,
        "engineApi": 1,
        "titleRole": true,
        "markup": [
          ".sv-section",
          "[data-sb-editable]",
          "[data-role]"
        ]
      }
    },
    {
      "folder": "split",
      "rel": "split/module.js",
      "descriptor": {
        "id": "split",
        "name": "Редакционный split",
        "version": "1.1.0",
        "description": "Попытка собрать текстовую и медиа-части в редакционный split, когда у шаблона обе группы выражены.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "16:9",
          "9:16",
          "1:1",
          "4:3"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 3,
        "engineApi": 1,
        "titleRole": true,
        "markup": [
          ".sv-section",
          "[data-sb-editable]",
          "[data-role]"
        ]
      }
    },
    {
      "folder": "v3011-hero",
      "rel": "v3011-hero/module.js",
      "descriptor": {
        "id": "v3011-hero",
        "name": "Главное медиа · Single-file v3-011",
        "version": "1.0.0",
        "description": "Выводит один ведущий кадр в центральную часть портрета, оставляя тексту вход и подписи.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 114,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    },
    {
      "folder": "v3011-type",
      "rel": "v3011-type/module.js",
      "descriptor": {
        "id": "v3011-type",
        "name": "Типографический постер · Single-file v3-011",
        "version": "1.0.0",
        "description": "Центрирует заявление и управляет свободным полем, не превращая текстовый шаблон в узкую колонку.",
        "sourceFormats": [
          "16:9"
        ],
        "targetFormats": [
          "9:16"
        ],
        "apps": [
          "Sandbox",
          "Pano Montage Studio"
        ],
        "scenarios": [
          "library",
          "timeline"
        ],
        "order": 115,
        "engineApi": 1,
        "markup": [
          ".sv-section"
        ]
      }
    }
  ],
  "errors": [],
  "unsupported": [
    "README.md"
  ]
};
