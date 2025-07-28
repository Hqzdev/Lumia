import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { AuthGuard } from '@/components/auth-guard';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const session = await auth();
  const nickname = session?.user?.nickname;

  const chatComponent = (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie?.value || DEFAULT_CHAT_MODEL}
        selectedVisibilityType="private"
        isReadonly={false}
        nickname={nickname}
      />
      <DataStreamHandler id={id} />
    </>
  );

  return <AuthGuard>{chatComponent}</AuthGuard>;
}
