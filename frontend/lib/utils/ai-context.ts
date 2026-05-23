/**
 * Утилита для сборки умного XML-контекста текущей страницы для ИИ-ассистента
 */
export function buildPageContext(locale: string, currentPath: string, pageData?: any): string {
  let xmlContext = `<page_context>\n`;
  xmlContext += `  <current_language>${locale}</current_language>\n`;
  xmlContext += `  <current_url>${currentPath}</current_url>\n`;

  if (pageData) {
    // Режим А: Пользователь просматривает КАТАЛОГ (передан массив элементов)
    if (Array.isArray(pageData) && pageData.length > 0) {
      xmlContext += `  <page_type>catalog_overview</page_type>\n`;
      xmlContext += `  <visible_items_on_screen>\n`;
      
      // Берем первые 6 карточек, которые видит юзер
      pageData.slice(0, 6).forEach((item: any) => {
        const title = typeof item.title === 'object' && item.title !== null
          ? (item.title[locale] || item.title.en || item.title.ru || '')
          : (item.title || '');
        const price = item.price || item.price_per_share || '';
        const isAsset = 'is_unique' in item || item.item_type === 'asset';

        xmlContext += `    <item>\n`;
        xmlContext += `      <type>${isAsset ? 'asset' : 'project'}</type>\n`;
        xmlContext += `      <title>${title}</title>\n`;
        xmlContext += `      <price>$${price}</price>\n`;
        xmlContext += `    </item>\n`;
      });
      
      xmlContext += `  </visible_items_on_screen>\n`;
    } 
    // Режим Б: Пользователь находится внутри конкретного ЛОТА (деталка)
    else if (typeof pageData === 'object' && pageData !== null) {
      const isAsset = currentPath.includes('/assets/') || pageData.item_type === 'asset';
      xmlContext += `  <page_type>${isAsset ? 'asset_detail' : 'project_detail'}</page_type>\n`;
      xmlContext += `  <entity_info>\n`;
      xmlContext += `    <title>${pageData.title?.[locale] || pageData.title || ''}</title>\n`;
      xmlContext += `    <price>$${pageData.price || pageData.price_per_share || ''}</price>\n`;
      
      if (pageData.description) {
        const desc = pageData.description?.[locale] || pageData.description || '';
        const cleanDesc = desc.replace(/<[^>]*>?/gm, '');
        xmlContext += `    <description>${cleanDesc.substring(0, 400)}...</description>\n`;
      }
      xmlContext += `  </entity_info>\n`;
    }
  } else {
    xmlContext += `  <page_type>general_browsing</page_type>\n`;
  }

  xmlContext += `</page_context>`;
  return xmlContext;
}