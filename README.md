# AI 零售(演示)

AI 零售网站的前端演示:商品浏览、购物车、AI 导购聊天、供应链和数据看板页面。商品、AI 回复与供应链数据来自 `src/stores/` 中的内置数据,登录/注册请求 `/api/auth/*` 与 `/api/users/*`,本仓库没有对应后端。

## 技术栈

Vite 6 + React 18 + TypeScript + Tailwind 3 + Zustand + React Router 7(包管理器 pnpm,有 `pnpm-lock.yaml`)。

## 运行

```bash
pnpm install --frozen-lockfile
pnpm dev            # = vite
```

`package.json` 中的脚本:`dev`、`build`(`tsc -b && vite build`)、`lint`(`eslint .`)、`preview`、`check`(`tsc -b --noEmit`)、`test`(`node --test test/*.test.cjs`)。

`pnpm test` 使用 Node 内置测试运行器和锁文件中的 TypeScript 编译器，检查实际商品 store 的评分筛选、排序、详情清空和并发请求顺序，以及购物车规格、金额、持久化和登录/注册失败路径。不启动浏览器，不调用后端或文生图服务。

## 环境变量

代码中没有读取任何环境变量,也没有 `.env.example`。

## 状态

原型,未上线。数据以 mock 为主,`src/stores/` 中保留若干 TODO;购物车状态管理已覆盖按规格变体的增删改，但购物车与商品详情页面仍为占位页。商品图片链接指向 Trae 的文生图服务,可能随时失效。

## 购物车状态接口

`removeFromCart(itemId)` 和 `updateQuantity(itemId, quantity)` 使用购物车项目的 `id`，以区分同一商品的不同规格。`getCartItem(productId, selectedSpecs)` 按商品与规格查找，省略规格表示无规格商品。规格键顺序不影响匹配。刷新时从已保存的商品和优惠券重算数量、金额及运费；旧时间戳 ID 会改为规格 ID，相同规格的旧条目合并并保留数量总和。

空购物车运费为零；非空购物车保留原有满 99 免运费、否则 10 的规则。优惠券按商品小计校验门槛，折扣最多抵扣商品金额，金额按分取整。不满足门槛或有效期的已选优惠券会在重算时移除。

登录和注册失败会拒绝 Promise，表单保留错误而不跳转。本项目仍使用演示用户和 token，占位认证不代表真实身份验证；接入真实后端前需确定认证合同与会话方案。
