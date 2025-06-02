export const hasPermission = (permissionId:string) => {
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  return permissions.includes(permissionId);
};