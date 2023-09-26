import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const productDocumentMapping: MappingTypeMapping = {
  properties: {
    id: { type: 'keyword' },
    merchantProductCode: { type: 'text' },
    sku: { type: 'keyword' },
    title: { type: 'text' },
    description: { type: 'text' },
    price: { type: 'float' },
    currency: { type: 'text' },
    rating: { type: 'float' },
    ratingsTotal: { type: 'integer' },
    shippingPrice: { type: 'float' },
    offerUrl: { type: 'text', index: false },
    brand: {
      type: 'object',
      properties: {
        code: { type: 'keyword' },
        name: { type: 'text' },
        description: { type: 'text' },
        logo: { type: 'text' },
        url: { type: 'text' },
      },
    },
    merchant: {
      type: 'object',
      properties: {
        region: { type: 'keyword' },
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
        logo: { type: 'text', index: false },
        url: { type: 'text', index: false },
      },
    },
    images: {
      type: 'nested',
      properties: {
        url: { type: 'text', index: false },
        primary: { type: 'boolean', index: false },
        type: { type: 'text', index: false },
      },
    },
    reviews: {
      type: 'nested',
      properties: {
        author: { type: 'text', index: false },
        text: { type: 'text', index: false },
        rating: { type: 'float', index: false },
        submittedOn: { type: 'date', index: false },
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
            logo: { type: 'text', index: false },
            url: { type: 'text', index: false },
          },
        },
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
