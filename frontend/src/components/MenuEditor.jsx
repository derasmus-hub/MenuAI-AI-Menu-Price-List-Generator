import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ─── Sortable wrappers ──────────────────────────────────────

function SortableCategory({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  )
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        className="mt-3 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      {children}
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────

export default function MenuEditor({ menuData, onChange, onConfirm }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // We track which category is being item-sorted via its index
  const [activeCatDrag, setActiveCatDrag] = useState(null)

  function update(fn) {
    const next = structuredClone(menuData)
    fn(next)
    onChange(next)
  }

  // ── Category-level actions ──

  function setCategoryName(catIdx, name) {
    update((d) => { d.categories[catIdx].name = name })
  }

  function addCategory() {
    update((d) => {
      d.categories.push({ name: '', items: [{ name: '', description: '', price: '' }] })
    })
  }

  function removeCategory(catIdx) {
    update((d) => { d.categories.splice(catIdx, 1) })
  }

  function handleCategoryDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    update((d) => {
      const oldIdx = d.categories.findIndex((_, i) => `cat-${i}` === active.id)
      const newIdx = d.categories.findIndex((_, i) => `cat-${i}` === over.id)
      d.categories = arrayMove(d.categories, oldIdx, newIdx)
    })
  }

  // ── Item-level actions ──

  function setItemField(catIdx, itemIdx, field, value) {
    update((d) => { d.categories[catIdx].items[itemIdx][field] = value })
  }

  function addItem(catIdx) {
    update((d) => {
      d.categories[catIdx].items.push({ name: '', description: '', price: '' })
    })
  }

  function removeItem(catIdx, itemIdx) {
    update((d) => { d.categories[catIdx].items.splice(itemIdx, 1) })
  }

  function handleItemDragEnd(catIdx, event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    update((d) => {
      const items = d.categories[catIdx].items
      const oldIdx = items.findIndex((_, i) => `item-${catIdx}-${i}` === active.id)
      const newIdx = items.findIndex((_, i) => `item-${catIdx}-${i}` === over.id)
      d.categories[catIdx].items = arrayMove(items, oldIdx, newIdx)
    })
  }

  const catIds = menuData.categories.map((_, i) => `cat-${i}`)

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        Sprawdź i edytuj menu
      </h2>
      <p className="text-slate-500 mb-8 text-center">
        AI przygotowało Twoje menu. Możesz je dowolnie zmodyfikować.
      </p>

      {/* Business info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa firmy</label>
          <input
            type="text"
            value={menuData.business_name}
            onChange={(e) => update((d) => { d.business_name = e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                       outline-none text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hasło reklamowe <span className="text-gray-400 font-normal">(opcjonalnie)</span>
          </label>
          <input
            type="text"
            value={menuData.tagline || ''}
            onChange={(e) => update((d) => { d.tagline = e.target.value || null })}
            placeholder="np. Najlepsza pizza w mieście"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                       outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Categories — sortable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext items={catIds} strategy={verticalListSortingStrategy}>
          {menuData.categories.map((cat, catIdx) => (
            <SortableCategory key={catIds[catIdx]} id={catIds[catIdx]}>
              {({ dragHandleProps }) => (
                <CategoryCard
                  cat={cat}
                  catIdx={catIdx}
                  sensors={sensors}
                  dragHandleProps={dragHandleProps}
                  onCategoryName={setCategoryName}
                  onRemoveCategory={removeCategory}
                  onItemField={setItemField}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onItemDragEnd={handleItemDragEnd}
                />
              )}
            </SortableCategory>
          ))}
        </SortableContext>
      </DndContext>

      {/* Add category */}
      <button
        type="button"
        onClick={addCategory}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                   text-gray-500 hover:border-emerald-400 hover:text-emerald-600
                   transition-colors cursor-pointer font-medium mt-2 mb-8"
      >
        + Dodaj kategorię
      </button>

      {/* Confirm */}
      <button
        type="button"
        onClick={onConfirm}
        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600
                   text-white font-semibold rounded-xl transition-colors cursor-pointer text-lg"
      >
        Wygląda dobrze →
      </button>
    </div>
  )
}

// ─── Category card ───────────────────────────────────────────

function CategoryCard({
  cat,
  catIdx,
  sensors,
  dragHandleProps,
  onCategoryName,
  onRemoveCategory,
  onItemField,
  onAddItem,
  onRemoveItem,
  onItemDragEnd,
}) {
  const itemIds = cat.items.map((_, i) => `item-${catIdx}-${i}`)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
      {/* Category header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...dragHandleProps}
        >
          ⠿
        </button>
        <input
          type="text"
          value={cat.name}
          onChange={(e) => onCategoryName(catIdx, e.target.value)}
          placeholder="Nazwa kategorii"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-semibold
                     text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     outline-none"
        />
        <button
          type="button"
          onClick={() => onRemoveCategory(catIdx)}
          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-sm px-2"
          title="Usuń kategorię"
        >
          Usuń
        </button>
      </div>

      {/* Items — sortable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => onItemDragEnd(catIdx, e)}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {cat.items.map((item, itemIdx) => (
            <SortableItem key={itemIds[itemIdx]} id={itemIds[itemIdx]}>
              <ItemRow
                item={item}
                catIdx={catIdx}
                itemIdx={itemIdx}
                onField={onItemField}
                onRemove={onRemoveItem}
              />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {/* Add item */}
      <button
        type="button"
        onClick={() => onAddItem(catIdx)}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium
                   mt-2 cursor-pointer"
      >
        + Dodaj pozycję
      </button>
    </div>
  )
}

// ─── Item row ────────────────────────────────────────────────

function ItemRow({ item, catIdx, itemIdx, onField, onRemove }) {
  return (
    <div className="flex-1 grid grid-cols-[1fr_1fr_auto_auto] sm:grid-cols-[2fr_2fr_1fr_auto] gap-2 mb-2">
      <input
        type="text"
        value={item.name}
        onChange={(e) => onField(catIdx, itemIdx, 'name', e.target.value)}
        placeholder="Nazwa pozycji"
        className="px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-slate-800
                   focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
      />
      <input
        type="text"
        value={item.description || ''}
        onChange={(e) => onField(catIdx, itemIdx, 'description', e.target.value || null)}
        placeholder="Opis (opcjonalnie)"
        className="px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-slate-800
                   focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
      />
      <input
        type="text"
        value={item.price}
        onChange={(e) => onField(catIdx, itemIdx, 'price', e.target.value)}
        placeholder="Cena"
        className="px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-slate-800
                   focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
                   w-24 sm:w-auto"
      />
      <button
        type="button"
        onClick={() => onRemove(catIdx, itemIdx)}
        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer
                   text-sm px-1 self-center"
        title="Usuń pozycję"
      >
        ✕
      </button>
    </div>
  )
}
