export function shouldShowAdvisorModel(name: string, model: string | null) {
  if (!model) return false;

  return name.trim().toLocaleLowerCase() !== model.trim().toLocaleLowerCase();
}
