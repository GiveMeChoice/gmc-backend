import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const mappings: MappingTypeMapping = {
  properties: {
    id: { type: 'keyword' },
    sku: { type: 'text' },
    provider: {
      type: 'object',
      properties: {
        key: { type: 'keyword' },
        productId: { type: 'text' },
        region: { type: 'keyword' },
        description: { type: 'text' },
      },
    },
    title: { type: 'text' },
    description: { type: 'text' },
    price: { type: 'float' },
    offerLink: { type: 'text', index: false },
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
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256,
        },
      },
    },
    category: {
      type: 'object',
      properties: {
        providerCategory: { type: 'text' },
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
    label: {
      type: 'object',
      properties: {
        providerLabel: { type: 'text' },
        gmcLabel: {
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
