import { getCategories } from './app/actions/categories.ts';

async function test() {
    const categories = await getCategories();
    console.log(categories);
}

test();