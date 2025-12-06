
import { GoogleGenAI, Type, FunctionDeclaration, Tool, Chat } from "@google/genai";
import { Note, Reminder, ToolName, UserMemory } from "../types";

// Tool Definitions
const createNoteTool: FunctionDeclaration = {
  name: ToolName.CREATE_NOTE,
  description: "Create a new note. Use this when the user wants to remember something.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the note" },
      content: { type: Type.STRING, description: "The body content of the note" },
      category: { 
        type: Type.STRING, 
        description: "Category (personal, work, ideas, study, other)",
        enum: ["personal", "work", "ideas", "study", "other"]
      }
    },
    required: ["title", "content"]
  }
};

const createReminderTool: FunctionDeclaration = {
  name: ToolName.CREATE_REMINDER,
  description: "Create a reminder. Infer ISO timestamp from user request relative to current time.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "What to remind the user about" },
      time: { type: Type.STRING, description: "ISO 8601 format date-time string" },
      category: { 
        type: Type.STRING, 
        enum: ["personal", "work", "ideas", "study", "other"]
      }
    },
    required: ["title", "time"]
  }
};

const getNotesTool: FunctionDeclaration = {
  name: ToolName.GET_NOTES,
  description: "Retrieve full details of current notes if the system context summary is not enough.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const getRemindersTool: FunctionDeclaration = {
  name: ToolName.GET_REMINDERS,
  description: "Retrieve active reminders.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const updateMemoryTool: FunctionDeclaration = {
  name: ToolName.UPDATE_MEMORY,
  description: "Update the long-term memory about the user (preferences, style, key facts). Use this when the user mentions something important about themselves.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fact: { type: Type.STRING, description: "A new fact or preference to remember about the user." }
    },
    required: ["fact"]
  }
};

const organizeNotesTool: FunctionDeclaration = {
  name: ToolName.ORGANIZE_NOTES,
  description: "Suggest organization for messy notes. Returns a JSON string mapping note IDs to new categories.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const tools: Tool[] = [{
  functionDeclarations: [createNoteTool, createReminderTool, getNotesTool, getRemindersTool, updateMemoryTool, organizeNotesTool]
}];

export class AssistantService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private userName: string = 'المستخدم';
  private userMemory: UserMemory = { summary: '', preferences: [] };
  private currentScene: string = 'all';
  private currentNotes: Note[] = [];
  private currentReminders: Reminder[] = [];

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  updateContext(name: string, memory: UserMemory, scene: string, notes: Note[], reminders: Reminder[]) {
    this.userName = name;
    this.userMemory = memory;
    this.currentScene = scene;
    this.currentNotes = notes;
    this.currentReminders = reminders;
    
    // We intentionally do NOT nullify chatSession here to preserve conversation history 
    // BUT we need to ensure the model gets the new system instruction.
    // The SDK applies systemInstruction at creation. For dynamic updates, 
    // we effectively start a new chat if the critical context changes significantly 
    // or we rely on injecting context in the next message (hidden).
    // For this implementation, we will reset to ensure strict adherence to the new state.
    this.chatSession = null; 
  }

  private getSystemInstruction(): string {
    const notesSummary = JSON.stringify(this.currentNotes.map(n => ({ id: n.id, title: n.title, category: n.category, date: new Date(n.createdAt).toLocaleDateString() })));
    const remindersSummary = JSON.stringify(this.currentReminders.map(r => ({ title: r.title, time: r.time, completed: r.completed, priority: r.priority })));
    const settings = JSON.stringify({ scene: this.currentScene });

    return `
      أنت المساعد الذكي داخل تطبيق "رفيق". وظيفتك أن تتذكر حالة المستخدم دائمًا بالاعتماد على البيانات القادمة من النظام الداخلي للتطبيق.
      عندما يرسل لك النظام بيانات مثل (الملاحظات، التنبيهات، الاسم، تفضيل الوضع الليلي، الإعدادات)، يجب أن تعتبرها "ذاكرة دائمة" وتبني إجاباتك عليها.

      لا تعتمد على الذاكرة الداخلية للنموذج؛ استخدم فقط البيانات القادمة من المستخدم والنظام أدناه.
      عندما يطلب المستخدم إضافة، حذف، تعديل أو قراءة أي شيء، أرسل أمر Function Calling بالصيغة الصحيحة ليربط بقاعدة بيانات التطبيق.

      هدفك: أن تبدو ثابت الذاكرة حتى لو تم إغلاق التطبيق، لأنك تعتمد على ذاكرة الجهاز وليس الذاكرة اللحظية للنموذج.

      هذه بياناتي الحالية (Context Snapshot):
      - الاسم: ${this.userName}
      - ملخص الذاكرة طويلة المدى: ${this.userMemory.summary || 'لا يوجد'}
      - التفضيلات: ${this.userMemory.preferences.join(', ')}
      - الملاحظات (ملخص): ${notesSummary}
      - التنبيهات: ${remindersSummary}
      - الإعدادات والمشهد الحالي: ${settings}
      - الوقت الحالي: ${new Date().toLocaleString('ar-EG')}

      تعليمات إضافية:
      1. تحدث بلهجة ودودة وشخصية بناءً على الاسم والتفضيلات.
      2. إذا لاحظت أن المستخدم لديه الكثير من المهام المتأخرة، اقترح عليه وضع التركيز.
      3. إذا طلب المستخدم شيئاً موجوداً بالفعل في البيانات أعلاه، أجب فوراً ولا تستخدم أداة "جلب البيانات" إلا إذا كنت بحاجة للتفاصيل الكاملة للنص.
    `;
  }

  async generateDailyBriefing(notes: Note[], reminders: Reminder[]): Promise<string> {
    // Temporary context update for the briefing generation
    this.currentNotes = notes;
    this.currentReminders = reminders;
    
    const prompt = `
      قم بإنشاء "موجز صباحي" قصير جداً (3 جمل) للمستخدم ${this.userName}.
      لديه ${notes.length} ملاحظات و ${reminders.filter(r => !r.completed).length} مهام معلقة.
      أعطه دفعة معنوية واقتراح واحد للتركيز عليه اليوم بناءً على المهام ذات الأولوية العالية.
    `;
    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { systemInstruction: this.getSystemInstruction() }
    });
    return result.text || "";
  }

  async sendMessage(
    message: string, 
    actions: {
      createNote: (n: any) => void,
      createReminder: (r: any) => void,
      getNotes: () => Note[],
      getReminders: () => Reminder[],
      updateMemory: (fact: string) => void,
      organizeNotes: (mappings: any) => void
    }
  ): Promise<string> {
    if (!this.chatSession) {
      this.chatSession = this.ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: this.getSystemInstruction(),
          tools: tools,
          temperature: 0.7,
        }
      });
    }

    try {
      let response = await this.chatSession.sendMessage({ message });
      
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = await Promise.all(response.functionCalls.map(async (call) => {
          const { name, args } = call;
          let result: any = { success: true };

          try {
            switch (name) {
              case ToolName.CREATE_NOTE:
                actions.createNote({
                  title: args.title,
                  content: args.content,
                  category: args.category || (this.currentScene !== 'all' ? this.currentScene : 'personal')
                });
                result = { message: "Note created successfully" };
                break;
                
              case ToolName.CREATE_REMINDER:
                actions.createReminder({
                  title: args.title,
                  time: args.time,
                  category: args.category || (this.currentScene !== 'all' ? this.currentScene : 'personal')
                });
                result = { message: "Reminder created successfully" };
                break;

              case ToolName.GET_NOTES:
                result = actions.getNotes();
                break;

              case ToolName.GET_REMINDERS:
                result = actions.getReminders();
                break;

              case ToolName.UPDATE_MEMORY:
                actions.updateMemory(args.fact as string);
                result = { message: "Long term memory updated" };
                break;
              
              case ToolName.ORGANIZE_NOTES:
                result = { message: "Notes organized successfully (simulated)" };
                break;

              default:
                result = { error: "Unknown tool" };
            }
          } catch (e) {
            result = { error: String(e) };
          }

          return {
            functionResponse: {
              name: name,
              response: { result },
              id: call.id
            }
          };
        }));

        response = await this.chatSession.sendMessage({
          message: functionResponses
        });
      }

      return response.text || "أنا هنا للمساعدة.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "واجهت مشكلة في الاتصال. حاول مرة أخرى.";
    }
  }
}

export const assistant = new AssistantService();
