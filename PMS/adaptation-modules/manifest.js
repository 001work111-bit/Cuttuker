/* Сгенерировано tools/build-adaptation-manifest.js — не редактировать вручную. */
window.PMS_ADAPTATION_MANIFEST = {
  "path": "adaptation-modules",
  "exists": true,
  "libraries": [
    {
      "rel": "_shared/css-groups.js"
    }
  ],
  "modules": [
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
    }
  ],
  "errors": [],
  "unsupported": [
    "README.md"
  ]
};
