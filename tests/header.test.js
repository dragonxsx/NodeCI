const puppeteer = require('puppeteer');
const userFactory = require('./factories/userFactory');
const sessionFactory = require('./factories/sessionFactory');
const Page = require('./helpers/page');

// test('Add two numbers', () => {
//     const sum = 1 + 2;
//     expect(sum).toEqual(3);
//     // assert();
//     // should();
// });

let page;
beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});


test('We can launch a browser', async () => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, show logout button', async () => {
    await page.login();

    const text = await page.getContentsOf('a[href="/auth/logout"]');

    expect(text).toEqual('Logout');
});
