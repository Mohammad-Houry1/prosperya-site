# FAQs

The CMS's question/answer records are paired by ID. For records with `is_question: true`, localized `content` is the displayed question (`name` is used only when that content is empty). Records with `is_question: false` link to their parent through `question`; their localized `content` is the answer. Multiple public answers are joined in CMS `order`, followed by legacy `sort_order` and ID. Empty translations are skipped, and question content is never reused as an answer.

The website API continues to return `{ id, question, answer, category_id }`, paginated by question. It resolves category slugs through the public FAQ categories and applies website permissions, tenant, project, language, country and publication filters to both questions and answers. Old inline FAQ records without `is_question` retain their `name` question and `content` answer.

Questions render as sanitized inline rich text in accordion buttons; answers retain sanitized block formatting. The website does not substitute a different language's answer when the requested translation is empty.
