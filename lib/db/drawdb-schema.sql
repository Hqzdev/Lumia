-- Lumia AI Database Schema for drawDB
-- This file is for visualization purposes only, not used in the project
-- Total: 12 tables (6 original tables split into 12)

-- ============================================
-- USER TABLES (2 tables)
-- ============================================

-- Table 1: User (Основная информация о пользователях)
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(64),
    nickname VARCHAR(32) NOT NULL UNIQUE
);

-- Table 2: UserSettings (Настройки и подписки пользователей)
CREATE TABLE "UserSettings" (
    userId UUID PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
    subscription VARCHAR(20) NOT NULL DEFAULT 'free',
    customization JSON
);

-- ============================================
-- CHAT TABLES (2 tables)
-- ============================================

-- Table 3: Chat (Основная информация о чатах)
CREATE TABLE "Chat" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP NOT NULL,
    title TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "User"(id)
);

-- Table 4: ChatSettings (Настройки видимости чатов)
CREATE TABLE "ChatSettings" (
    "chatId" UUID PRIMARY KEY REFERENCES "Chat"(id) ON DELETE CASCADE,
    visibility VARCHAR NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private'))
);

-- ============================================
-- MESSAGE TABLES (2 tables)
-- ============================================

-- Table 5: Message_v2 (Основная информация о сообщениях)
CREATE TABLE "Message_v2" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "chatId" UUID NOT NULL REFERENCES "Chat"(id),
    role VARCHAR NOT NULL,
    "createdAt" TIMESTAMP NOT NULL
);

-- Table 6: MessageContent (Контент сообщений)
CREATE TABLE "MessageContent" (
    "messageId" UUID PRIMARY KEY REFERENCES "Message_v2"(id) ON DELETE CASCADE,
    parts JSON NOT NULL,
    attachments JSON NOT NULL
);

-- ============================================
-- VOTE TABLES (2 tables)
-- ============================================

-- Table 7: Vote_v2 (Голоса за сообщения)
CREATE TABLE "Vote_v2" (
    "chatId" UUID NOT NULL REFERENCES "Chat"(id),
    "messageId" UUID NOT NULL REFERENCES "Message_v2"(id),
    "isUpvoted" BOOLEAN NOT NULL,
    PRIMARY KEY ("chatId", "messageId")
);

-- Table 8: VoteMetadata (Метаданные голосов)
CREATE TABLE "VoteMetadata" (
    "chatId" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("chatId", "messageId"),
    FOREIGN KEY ("chatId", "messageId") REFERENCES "Vote_v2"("chatId", "messageId")
);

-- ============================================
-- DOCUMENT TABLES (2 tables)
-- ============================================

-- Table 9: Document (Основная информация о документах)
CREATE TABLE "Document" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP NOT NULL,
    title TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "User"(id),
    PRIMARY KEY (id, "createdAt")
);

-- Table 10: DocumentContent (Контент документов)
CREATE TABLE "DocumentContent" (
    "documentId" UUID NOT NULL,
    "documentCreatedAt" TIMESTAMP NOT NULL,
    content TEXT,
    kind VARCHAR NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'code', 'image', 'sheet')),
    PRIMARY KEY ("documentId", "documentCreatedAt"),
    FOREIGN KEY ("documentId", "documentCreatedAt") REFERENCES "Document"(id, "createdAt")
);

-- ============================================
-- SUGGESTION TABLES (2 tables)
-- ============================================

-- Table 11: Suggestion (Основная информация о предложениях)
CREATE TABLE "Suggestion" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "documentCreatedAt" TIMESTAMP NOT NULL,
    "userId" UUID NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("documentId", "documentCreatedAt") REFERENCES "Document"(id, "createdAt")
);

-- Table 12: SuggestionContent (Контент предложений)
CREATE TABLE "SuggestionContent" (
    "suggestionId" UUID PRIMARY KEY REFERENCES "Suggestion"(id) ON DELETE CASCADE,
    "originalText" TEXT NOT NULL,
    "suggestedText" TEXT NOT NULL,
    description TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- RELATIONSHIPS SUMMARY
-- ============================================
-- User (1) -> (1) UserSettings
-- User (1) -> (N) Chat
-- Chat (1) -> (1) ChatSettings
-- Chat (1) -> (N) Message_v2
-- Message_v2 (1) -> (1) MessageContent
-- Chat (1) -> (N) Vote_v2
-- Message_v2 (1) -> (N) Vote_v2
-- Vote_v2 (1) -> (1) VoteMetadata
-- User (1) -> (N) Document
-- Document (1) -> (1) DocumentContent
-- Document (1) -> (N) Suggestion
-- User (1) -> (N) Suggestion
-- Suggestion (1) -> (1) SuggestionContent




SELECT sc.originalText, sc.suggestedText, sc.description, sc.isResolved, s.createdAt
FROM Suggestion s
JOIN SuggestionContent sc ON s.id = sc.suggestionId
WHERE s.documentId = :documentId
ORDER BY s.createdAt DESC;




