import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // biome-ignore lint: Forbidden non-null assertion.
    const chats = await getChatsByUserId({ id: session.user.id! });
    return Response.json(chats, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in /api/history:', error);
    return Response.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
