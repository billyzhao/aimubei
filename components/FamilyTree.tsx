import Link from "next/link";
import type { FamilyTree as FamilyTreeData, FamilyNode } from "@/lib/data";

const GROUP_META: {
  key: keyof FamilyTreeData;
  label: string;
  icon: string;
  emptyHint: string;
}[] = [
  { key: "parents", label: "父母", icon: "👴", emptyHint: "尚未添加父母" },
  { key: "spouses", label: "配偶", icon: "💑", emptyHint: "尚未添加配偶" },
  { key: "siblings", label: "兄弟姐妹", icon: "👫", emptyHint: "尚未添加兄弟姐妹" },
  { key: "children", label: "子女", icon: "🧒", emptyHint: "尚未添加子女" },
];

function nodeEmoji(group: keyof FamilyTreeData, node: FamilyNode): string {
  if (node.avatar) return ""; // 有头像时渲染图片
  if (group === "parents") return "👴";
  if (group === "spouses") return "💑";
  if (group === "siblings") return "👫";
  if (group === "children") return "🧒";
  return "🌿";
}

function RelationCard({ group, node }: { group: keyof FamilyTreeData; node: FamilyNode }) {
  return (
    <Link
      href={`/memorial/${node.slug}`}
      className="group flex items-center gap-3 p-3 rounded-2xl bg-midnight-800/40 border border-amethyst-500/10 hover:border-amethyst-500/40 hover:bg-amethyst-500/10 transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-midnight-700 to-midnight-800 border border-amethyst-500/20 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
        {node.avatar ? (
          <img src={node.avatar} alt={node.name} className="w-full h-full object-cover" />
        ) : (
          nodeEmoji(group, node)
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white truncate group-hover:text-amethyst-300 transition-colors">
          {node.name}
        </div>
        <div className="text-xs text-mist-400 truncate">
          {node.title}
          {node.relationship ? ` · ${node.relationship}` : ""}
        </div>
        {node.note && (
          <div className="text-xs text-mist-500 truncate mt-0.5">{node.note}</div>
        )}
      </div>
    </Link>
  );
}

export default function FamilyTree({ tree }: { tree: FamilyTreeData }) {
  const hasAny =
    tree.parents.length +
      tree.spouses.length +
      tree.siblings.length +
      tree.children.length >
    0;

  if (!hasAny) {
    return (
      <div className="text-center py-10 text-mist-400 text-sm">
        这座纪念馆还没有家族关系。在编辑页添加父母、配偶、子女或兄弟姐妹，让几代人的记忆相连。
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {GROUP_META.map((g) => {
        const list = tree[g.key];
        if (!list || list.length === 0) return null;
        return (
          <div key={g.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{g.icon}</span>
              <h3 className="text-base font-semibold text-white">{g.label}</h3>
              <span className="text-xs text-mist-400">({list.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((node) => (
                <RelationCard key={node.id} group={g.key} node={node} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
