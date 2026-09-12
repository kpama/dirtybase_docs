import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Dirtybase",
  description: "Documentation for the Dirtybase Rust web framework",
  themeConfig: {
    siteTitle: 'Dirtybase <span class="version-tag">version 0.1</span>',
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/docs/" },
      { text: "GitHub", link: "https://github.com/kpama/dirtybase" },
    ],

    sidebar: [
          {
            text: "Getting Started",
            items: [
              { text: "Overview", link: "/docs/" },
              { text: "Installation", link: "/docs/v1/installation" },
              { text: "Configuration", link: "/docs/v1/configuration" },
              { text: "env variables", link: "/docs/v1/config/env_config" },
              { text: "Project Structure", link: "/docs/v1/project-structure" },
            ],
          },
          {
            text: "Core Concepts",
            items: [
              { text: "Application Lifecycle", link: "/docs/v1/lifecycle" },
              { text: "Extensions", link: "/docs/v1/extensions" },
              { text: "Context", link: "/docs/v1/context" },
            ],
          },
          {
            text: "HTTP",
            items: [
              { text: "Overview", link: "/docs/v1/http" },
              { text: "Routing", link: "/docs/v1/routing" },
              { text: "Middleware", link: "/docs/v1/middleware" },
              { text: "Requests and Responses", link: "/docs/v1/requests" },
            ],
          },
          {
            text: "Database",
            items: [
              { text: "Getting Started", link: "/docs/v1/database" },
              { text: "Query Builder", link: "/docs/v1/query-builder" },
              { text: "Migrations", link: "/docs/v1/migrations" },
              { text: "Seeding", link: "/docs/v1/seeding" },
            ],
          },
          {
            text: "ORM",
            items: [
              { text: "Getting Started", link: "/docs/v1/orm/index" },
              { text: "Model", link: "/docs/v1/orm/model" },
              { text: "Repository", link: "/docs/v1/orm/repository" },
              { text: "Relation", link: "/docs/v1/orm/relationship" },
              { text: "Deeper", link: "/docs/v1/orm/deeper.md" },
            ],
          },
          {
            text: "Services",
            items: [
              { text: "Authentication", link: "/docs/v1/authentication" },
              { text: "Authorization", link: "/docs/v1/authorization" },
              { text: "Cache", link: "/docs/v1/cache" },
              { text: "Sessions", link: "/docs/v1/sessions" },
              { text: "Multitenancy", link: "/docs/v1/multitenancy" },
              { text: "Queues and Cron", link: "/docs/v1/queues" },
            ],
          },
          {
            text: "CLI",
            items: [{ text: "Command Reference", link: "/docs/v1/cli" }],
          },
          {
            text: "Contributing",
            items: [{ text: "Contribution Guide", link: "/docs/v1/contributing" }],
          },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/kpama/dirtybase" },
    ],
  },
});
