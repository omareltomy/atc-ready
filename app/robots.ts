import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/private/', '/admin/'],
    },
    sitemap: 'https://training.atcready.com/sitemap.xml',
  }
}