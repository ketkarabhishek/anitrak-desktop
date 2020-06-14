import { KitsuLogin } from "./auth"

test("Kitsu Auth", async () => {
  const auth = await KitsuLogin("akai34", "intex_dv1")
  expect(auth).toHaveProperty("access_token")
  expect(auth).toHaveProperty("refresh_token")
})

test("Kitsu Auth Fail ", async () => {
  await expect(KitsuLogin("aka4", "intex_d")).rejects.toThrow()
})
