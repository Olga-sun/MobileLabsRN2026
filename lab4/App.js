import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Button, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export default function App() {
  const getSafePath = () => FileSystem.documentDirectory || FileSystem.cacheDirectory || 'file:///';

  const [initialPath] = useState(getSafePath());
  const [currentPath, setCurrentPath] = useState(getSafePath());
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diskInfo, setDiskInfo] = useState(null);

  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [fileContent, setFileContent] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editContent, setEditContent] = useState('');

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchStorageInfo = async () => {
    try {
      let free = 0; let total = 0;
      if (typeof FileSystem.getFreeDiskStorageAsync === 'function') {
        free = await FileSystem.getFreeDiskStorageAsync();
        total = await FileSystem.getTotalDiskCapacityAsync();
      }
      if (total > 0) {
        setDiskInfo({
          total: formatBytes(total),
          free: formatBytes(free),
          used: formatBytes(total - free)
        });
      } else {
        setDiskInfo({ total: 'Н/Д', free: 'Н/Д', used: 'Н/Д' });
      }
    } catch (error) {
      setDiskInfo({ total: 'Н/Д', free: 'Н/Д', used: 'Н/Д' });
    }
  };

  const loadDirectoryContent = async (path) => {
    if (!path) return;
    setLoading(true);
    try {
      const fileNames = await FileSystem.readDirectoryAsync(path);
      const details = await Promise.all(
          fileNames.map(async (name) => {
            const fileUri = path + name + (path.endsWith('/') ? '' : '/');
            const info = await FileSystem.getInfoAsync(fileUri);
            return { name, isDirectory: info.isDirectory, uri: fileUri };
          })
      );
      setFiles(details);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (currentPath === initialPath) return;
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.join('/') + '/';
    setCurrentPath(newPath.length < initialPath.length ? initialPath : newPath);
  };

  const openDetails = async (item) => {
    try {
      const info = await FileSystem.getInfoAsync(item.uri);
      let content = '';
      let isTxt = item.name.toLowerCase().endsWith('.txt');

      if (!item.isDirectory && isTxt) {
        content = await FileSystem.readAsStringAsync(item.uri);
      }

      setSelectedItem({
        ...item,
        size: info.size || 0,
        modTime: info.modificationTime || Date.now() / 1000,
        isTxt: isTxt
      });
      setEditContent(content);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося відкрити деталі');
    }
  };

  const handlePressItem = (item) => {
    if (item.isDirectory) {
      setCurrentPath(item.uri);
    } else {
      openDetails(item);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return Alert.alert('Помилка', 'Введіть назву');
    try {
      const folderUri = currentPath + newFolderName.trim() + '/';
      await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      Alert.alert('Успіх', `Папку створено!`);
      setNewFolderName('');
      loadDirectoryContent(currentPath);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося створити папку');
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return Alert.alert('Помилка', 'Введіть ім\'я');
    try {
      const fileNameWithExt = newFileName.trim().endsWith('.txt') ? newFileName.trim() : newFileName.trim() + '.txt';
      const fileUri = currentPath + fileNameWithExt;
      await FileSystem.writeAsStringAsync(fileUri, fileContent, { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert('Успіх', `Файл створено!`);
      setNewFileName('');
      setFileContent('');
      loadDirectoryContent(currentPath);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося створити файл');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await FileSystem.writeAsStringAsync(selectedItem.uri, editContent);
      Alert.alert('Успіх', 'Зміни збережено!');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти');
    }
  };

  const handleDelete = () => {
    Alert.alert(
        'Підтвердження',
        `Видалити "${selectedItem.name}"?`,
        [
          { text: 'Скасування', style: 'cancel' },
          { text: 'Видалити', style: 'destructive', onPress: async () => {
              try {
                await FileSystem.deleteAsync(selectedItem.uri);
                setModalVisible(false);
                loadDirectoryContent(currentPath);
              } catch (error) {
                Alert.alert('Помилка', 'Не вдалося видалити');
              }
            }
          }
        ]
    );
  };

  useEffect(() => {
    if (currentPath === 'file:///') {
      setCurrentPath(initialPath);
    } else {
      fetchStorageInfo();
      loadDirectoryContent(currentPath);
    }
  }, [currentPath]);

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.storageCard}>
          <Text style={styles.storageTitle}>{"Статистика пам'яті пристрою"}</Text>
          {diskInfo ? (
              <View style={styles.storageGrid}>
                <Text style={styles.storageText}>Всього: <Text style={styles.bold}>{diskInfo.total}</Text></Text>
                <Text style={styles.storageText}>Вільно: <Text style={styles.boldSuccess}>{diskInfo.free}</Text></Text>
                <Text style={styles.storageText}>Зайнято: <Text style={styles.boldDanger}>{diskInfo.used}</Text></Text>
              </View>
          ) : <ActivityIndicator size="small" color="#007AFF" />}
        </View>

        <View style={styles.pathContainer}>
          <View style={styles.pathHeader}>
            <Text style={styles.pathLabel}>Поточний шлях:</Text>
            {currentPath !== initialPath && (
                <TouchableOpacity onPress={handleGoBack}>
                  <Text style={styles.backButton}>⬅ Назад</Text>
                </TouchableOpacity>
            )}
          </View>
          <Text style={styles.pathText} numberOfLines={2}>{currentPath}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Нова папка</Text>
          <View style={styles.row}>
            <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Назва папки"
                value={newFolderName}
                onChangeText={setNewFolderName}
            />
            <Button title="Створити" onPress={handleCreateFolder} />
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Новий .txt файл</Text>
          <TextInput
              style={[styles.input, { marginBottom: 8 }]}
              placeholder={"Ім'я файлу (напр. note)"}
              value={newFileName}
              onChangeText={setNewFileName}
          />
          <TextInput
              style={[styles.input, { minHeight: 60, maxHeight: 120, textAlignVertical: 'top', marginBottom: 8 }]}
              placeholder="Вміст тексту..."
              multiline
              value={fileContent}
              onChangeText={setFileContent}
          />
          <Button title="Зберегти файл" color="#34C759" onPress={handleCreateFile} />
        </View>

        {/* Блок зі списком тепер має flex: 1, щоб займати весь вільний простір і скролитися */}
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Вміст директорії (Утримуйте папку для деталей):</Text>
          {loading ? <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} /> : (
              <FlatList
                  data={files}
                  keyExtractor={(item) => item.uri}
                  renderItem={({ item }) => (
                      <TouchableOpacity
                          style={styles.fileItem}
                          onPress={() => handlePressItem(item)}
                          onLongPress={() => openDetails(item)}
                      >
                        <Text style={styles.fileIcon}>{item.isDirectory ? '📁' : '📄'}</Text>
                        <View style={styles.fileDetails}>
                          <Text style={item.isDirectory ? styles.folderName : styles.fileName}>{item.name}</Text>
                        </View>
                      </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={styles.emptyText}>Папка порожня.</Text>}
              />
          )}
        </View>

        <Modal visible={modalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedItem && (
                  <ScrollView>
                    <Text style={styles.modalTitle}>Деталі {selectedItem.isDirectory ? 'папки' : 'файлу'}</Text>
                    <Text style={styles.detailText}>Назва: <Text style={styles.bold}>{selectedItem.name}</Text></Text>
                    <Text style={styles.detailText}>Тип: {selectedItem.isDirectory ? 'Директорія (Папка)' : (selectedItem.isTxt ? 'Текстовий документ (.txt)' : 'Інший файл')}</Text>
                    <Text style={styles.detailText}>Розмір: {formatBytes(selectedItem.size)}</Text>
                    <Text style={styles.detailText}>Остання зміна: {new Date(selectedItem.modTime * 1000).toLocaleString()}</Text>

                    {selectedItem.isTxt && (
                        <View style={{ marginTop: 15 }}>
                          <Text style={styles.formTitle}>Вміст файлу (редагування):</Text>
                          <TextInput
                              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                              multiline
                              value={editContent}
                              onChangeText={setEditContent}
                          />
                          <View style={{ marginTop: 10 }}>
                            <Button title="Зберегти зміни" color="#34C759" onPress={handleSaveEdit} />
                          </View>
                        </View>
                    )}

                    <View style={styles.modalActions}>
                      <Button title="Видалити" color="#FF3B30" onPress={handleDelete} />
                      <Button title="Закрити" color="#8E8E93" onPress={() => setModalVisible(false)} />
                    </View>
                  </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', paddingTop: 50, paddingHorizontal: 16 },
  storageCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 1 },
  storageTitle: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  storageGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  storageText: { fontSize: 12, color: '#8E8E93' },
  bold: { fontWeight: '700', color: '#1C1C1E' },
  boldSuccess: { fontWeight: '700', color: '#34C759' },
  boldDanger: { fontWeight: '700', color: '#FF3B30' },
  pathContainer: { marginBottom: 12 },
  pathHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pathLabel: { fontSize: 11, fontWeight: '500', color: '#8E8E93' },
  backButton: { color: '#007AFF', fontWeight: 'bold', fontSize: 14, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#E5F0FF', borderRadius: 6 },
  pathText: { fontSize: 13, color: '#007AFF', marginTop: 2 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
  formTitle: { fontSize: 13, fontWeight: '600', color: '#3A3A3C', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  // З цього стилю прибрано flex: 1
  input: { borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, backgroundColor: '#F9F9F9' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginVertical: 8 },
  fileItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, marginBottom: 6, alignItems: 'center' },
  fileIcon: { fontSize: 22 },
  fileDetails: { flex: 1, marginLeft: 10 },
  folderName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  fileName: { fontSize: 15, color: '#3A3A3C' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 20, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 5, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  detailText: { fontSize: 14, color: '#3A3A3C', marginBottom: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
});