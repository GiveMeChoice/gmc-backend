import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const mappings: MappingTypeMapping = {
  properties: {
    id: { type: 'keyword' },
    region: { type: 'keyword' },
    merchantProductCode: { type: 'text' },
    sku: { type: 'keyword' },
    title: { type: 'text' },
    description: { type: 'text' },
    price: { type: 'float' },
    offerLink: { type: 'text', index: false },
    merchant: {
      type: 'object',
      properties: {
        key: { type: 'keyword' },
        name: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        description: { type: 'text' },
        logoUrl: { type: 'text', index: false },
        infoLink: { type: 'text', index: false },
      },
    },
    images: {
      type: 'nested',
      properties: {
        list: {
          type: 'object',
          properties: {
            url: { type: 'text', index: false },
          },
        },
        detail: {
          type: 'object',
          properties: {
            url: { type: 'text', index: false },
          },
        },
        other: {
          type: 'nested',
          properties: {
            url: { type: 'text', index: false },
          },
        },
      },
    },
    brand: {
      type: 'object',
      properties: {
        code: { type: 'keyword' },
        name: { type: 'text' },
        description: { type: 'text' },
        logoUrl: { type: 'text' },
        infoLink: { type: 'text' },
      },
    },
    category: {
      type: 'object',
      properties: {
        merchantCategory: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        gmcCategory: {
          type: 'object',
          properties: {
            name: {
              type: 'text',
              fields: {
                keyword: {
                  type: 'keyword',
                  ignore_above: 256,
                },
              },
            },
            subcategory: {
              type: 'object',
              properties: {
                name: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
                subcategory: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'text',
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    labels: {
      type: 'nested',
      properties: {
        merchantLabel: {
          type: 'object',
          properties: {
            code: { type: 'keyword' },
            name: { type: 'text' },
            description: { type: 'text' },
            logoUrl: { type: 'text', index: false },
            infoLink: { type: 'text', index: false },
          },
        },
        group: {
          type: 'object',
          properties: {
            name: {
              type: 'text',
              fields: {
                keyword: {
                  type: 'keyword',
                  ignore_above: 256,
                },
              },
            },
            description: { type: 'text' },
            sublabel: {
              type: 'object',
              properties: {
                name: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256,
                    },
                  },
                },
                description: { type: 'text' },
                sublabel: {
                  type: 'object',
                  properties: {
                    description: { type: 'text' },
                    name: {
                      type: 'text',
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
