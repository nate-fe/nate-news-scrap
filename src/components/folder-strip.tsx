import Image from "next/image";
import Link from "next/link";
import { scrapListHref } from "@/lib/scrap-list-url";
import { NewFolderButton } from "@/components/new-folder-button";
import { Icon } from "@/components/icon";
import type { ScrapFolderSummary } from "@/types/scrap";

// 내 스크랩 위쪽의 폴더 줄 (인스타그램 '저장됨'의 컬렉션처럼).
// [모든 스크랩] [폴더1] [폴더2] ... 를 가로로 넘겨 보고, 누르면 그 폴더의 스크랩만 본다.
export function FolderStrip({
  folders,
  all,
  currentFolderId,
}: {
  folders: ScrapFolderSummary[];
  all: { count: number; coverImageUrl?: string };
  currentFolderId?: string;
}) {
  return (
    <section aria-label="스크랩 폴더" className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-on-surface">스크랩 폴더</h2>
        <NewFolderButton />
      </div>
      {/* 가로 스크롤: 화면 밖으로 넘치지 않고 이 줄 안에서만 넘어간다 */}
      <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 pt-1 pb-1 sm:mx-0 sm:px-1">
        <FolderTile
          href={scrapListHref({})}
          name="모든 스크랩"
          count={all.count}
          coverImageUrl={all.coverImageUrl}
          icon="bookmark"
          selected={!currentFolderId}
        />
        {folders.map((f) => (
          <FolderTile
            key={f.id}
            href={scrapListHref({ folder: f.id })}
            name={f.name}
            count={f.count}
            coverImageUrl={f.coverImageUrl}
            icon="folder"
            selected={currentFolderId === f.id}
          />
        ))}
      </ul>
    </section>
  );
}

function FolderTile({
  href,
  name,
  count,
  coverImageUrl,
  icon,
  selected,
}: {
  href: string;
  name: string;
  count: number;
  coverImageUrl?: string;
  icon: "bookmark" | "folder";
  selected: boolean;
}) {
  return (
    <li className="w-14 shrink-0">
      <Link href={href} aria-current={selected ? "page" : undefined} className="group block">
        <span
          className={`relative block size-14 overflow-hidden rounded-[10px] bg-surface ${
            selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
          }`}
        >
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-on-surface-variant/50">
              <Icon name={icon} size={20} />
            </span>
          )}
        </span>
        <span
          className={`mt-1 block truncate text-[13px] font-bold ${selected ? "text-primary" : "text-on-surface"}`}
          title={name}
        >
          {name}
        </span>
        <span className="block text-[12px] text-on-surface-variant">{count}개</span>
      </Link>
    </li>
  );
}
