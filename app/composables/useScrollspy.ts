/**
 * Scrollspy composable for legal pages with a table-of-contents sidebar.
 * Tracks which section is currently in view via IntersectionObserver.
 */
export function useScrollspy(sections: { id: string, title: string }[]) {
  const activeSection = ref(sections[0]?.id ?? '')

  onMounted(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection.value = entry.target.id
          }
        })
      },
      { rootMargin: '-100px 0px -60% 0px' },
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    onBeforeUnmount(() => observer.disconnect())
  })

  return { activeSection }
}
