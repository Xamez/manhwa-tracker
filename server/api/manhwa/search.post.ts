import { searchManhwa } from '~~/server/utils/search';

export default defineEventHandler(async event => {
  const { search } = await readBody(event);

  if (!search) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query is required',
    });
  }

  return await searchManhwa(search);
});
