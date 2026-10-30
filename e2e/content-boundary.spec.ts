import { expect, test } from "@playwright/test";

test("Markdown routes reject slugs that escape the public content directory", async ({
	request,
}) => {
	for (const slug of ["..%2Fblog%2F_placeholder", "..%5Cblog%5C_placeholder"]) {
		const response = await request.get(`/case-study-markdown/${slug}`);
		expect(response.status()).toBe(404);
		expect(await response.text()).toBe("Not found");
	}
});
